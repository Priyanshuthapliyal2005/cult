import { NextRequest, NextResponse } from 'next/server';
import { dynamicCityService } from '@/lib/dynamicCityService';

export async function POST(req: NextRequest) {
  const { cityName, countryName } = await req.json();
  try {
    const city = await dynamicCityService.searchCity(cityName, countryName);
    return NextResponse.json({ city });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
