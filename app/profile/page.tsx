'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Heart, MapPin, Globe, ArrowLeft, Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: '',
    email: '',
    languages: [] as string[],
    interests: [] as string[],
  });

  const updateProfile = trpc.updateProfile.useMutation();
  const getUserStats = trpc.getUserStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const getFavorites = trpc.getFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email,
        languages: user.languages || [],
        interests: user.interests || [],
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(editedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        email: user.email,
        languages: user.languages || [],
        interests: user.interests || [],
      });
    }
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-6">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Profile</h1>
              <p className="text-sm text-gray-500">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar || ''} />
                    <AvatarFallback className="text-xl">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {isEditing ? (
                      <Input
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        className="text-xl font-bold mb-2"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                    )}
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={updateProfile.isLoading}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getUserStats.data?.conversationCount || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total chat sessions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Destinations</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getUserStats.data?.destinationsVisited || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Places explored
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {getFavorites.data?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Saved items
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Language Preferences</CardTitle>
                  <CardDescription>Languages you speak or want to learn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(isEditing ? editedUser.languages : user?.languages || []).map((language) => (
                        <Badge key={language} variant="secondary">
                          {language}
                          {isEditing && (
                            <button
                              onClick={() =>
                                setEditedUser({
                                  ...editedUser,
                                  languages: editedUser.languages.filter((l) => l !== language),
                                })
                              }
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a language"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !editedUser.languages.includes(value)) {
                                setEditedUser({
                                  ...editedUser,
                                  languages: [...editedUser.languages, value],
                                });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Interests</CardTitle>
                  <CardDescription>Your travel and cultural interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(isEditing ? editedUser.interests : user?.interests || []).map((interest) => (
                        <Badge key={interest} variant="outline">
                          {interest}
                          {isEditing && (
                            <button
                              onClick={() =>
                                setEditedUser({
                                  ...editedUser,
                                  interests: editedUser.interests.filter((i) => i !== interest),
                                })
                              }
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add an interest"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value && !editedUser.interests.includes(value)) {
                                setEditedUser({
                                  ...editedUser,
                                  interests: [...editedUser.interests, value],
                                });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Favorites</CardTitle>
                  <CardDescription>Places and insights you've saved</CardDescription>
                </CardHeader>
                <CardContent>
                  {getFavorites.isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : getFavorites.data?.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No favorites yet</p>
                      <p className="text-sm text-gray-400">
                        Start exploring destinations to save your favorites
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getFavorites.data?.map((favorite) => (
                        <div key={favorite.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{favorite.type}</h4>
                            <p className="text-sm text-gray-600">
                              Reference ID: {favorite.referenceId}
                            </p>
                          </div>
                          <Badge variant="secondary">{favorite.type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent interactions and travels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Activity tracking coming soon</p>
                    <p className="text-sm text-gray-400">
                      We're working on detailed activity insights
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}