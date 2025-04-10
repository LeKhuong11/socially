"use client"

import { getPostsByUserId, getProfileByUsername, updateProfile } from "@/actions/profile.action"
import { toggleFollow } from "@/actions/user.action"
import PostCard from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@radix-ui/react-separator"
import { format } from "date-fns"
import { CalendarIcon, EditIcon, FileTextIcon, HeartIcon, LinkIcon, MapPinIcon } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useAppContext } from "@/app/context-provider"

type UserProfile = Awaited<ReturnType<typeof getProfileByUsername>>
type Posts = Awaited<ReturnType<typeof getPostsByUserId>>

interface ProfilePageProps {
    userProfile: NonNullable<UserProfile>,
    posts: Posts,
    likedPosts: Posts,
    isFollowing: boolean
}

function ProfilePage({userProfile, posts, likedPosts, isFollowing: initialIsFollowing, }: ProfilePageProps) {
    const { user: currentUser } = useAppContext();
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

    const [editForm, setEditForm] = useState({
        name: userProfile.name || "",
        bio: userProfile.bio || "",
        location: userProfile.location || "",
        website: userProfile.website || "",
    });

    const handleEditSubmit = async () => {
        const formData = new FormData();

        Object.entries(editForm).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const result = await updateProfile(formData);
        if (result.success) {
          setShowEditDialog(false);
          toast.success("Profile updated successfully");
        }
    }


    const handleFollow = async () => {
        if (!currentUser) return;

        try {
          setIsUpdatingFollow(true);
          await toggleFollow(userProfile.id);
          setIsFollowing(!isFollowing);
        } catch {
          toast.error("Failed to update follow status");
        } finally {
          setIsUpdatingFollow(false);
        }
    }

    const isOwnProfile = currentUser?.username === userProfile.username || currentUser?.email.split("@")[0] === userProfile.username;
    const formattedDate = format(new Date(userProfile.createdAt), "MMMM yyyy");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
            <Card className="bg-card">
                <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={userProfile.image || "/images/avatar-default.jpg"} />
                    </Avatar>
                    <h1 className="mt-4 text-2xl font-bold">{userProfile.name ?? userProfile.username}</h1>
                    <p className="text-muted-foreground">@{userProfile.username}</p>
                    <p className="mt-2 text-sm">{userProfile.bio}</p>

                    {/* PROFILE STATS */}
                    <div className="w-full mt-6">
                    <div className="flex justify-between mb-4">
                        <div>
                          <div className="font-semibold">{userProfile._count.following.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Following</div>
                        </div>
                        <Separator orientation="vertical" />
                        <div>
                          <div className="font-semibold">{userProfile._count.followers.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Followers</div>
                        </div>
                        <Separator orientation="vertical" />
                        <div>
                          <div className="font-semibold">{userProfile._count.posts.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Posts</div>
                        </div>
                    </div>
                    </div>

                    {!currentUser ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="default" className="w-full mt-4">Follow</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                              Make changes to your profile here. Click save when you are done.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name" className="text-right">
                                Name
                              </Label>
                              <Input id="name" value="Pedro Duarte" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="username" className="text-right">
                                Username
                              </Label>
                              <Input id="username" value="@peduarte" className="col-span-3" />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : isOwnProfile ? (
                    <Button className="w-full mt-4" onClick={() => setShowEditDialog(true)}>
                        <EditIcon className="size-4 mr-2" />
                        Edit Profile
                    </Button>
                    ) : (
                    <Button
                        className="w-full mt-4"
                        onClick={handleFollow}
                        disabled={isUpdatingFollow}
                        variant={isFollowing ? "outline" : "default"}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    )}

                    {/* LOCATION & WEBSITE */}
                    <div className="w-full mt-6 space-y-2 text-sm">
                    {userProfile.location && (
                        <div className="flex items-center text-muted-foreground">
                        <MapPinIcon className="size-4 mr-2" />
                        {userProfile.location}
                        </div>
                    )}
                    {userProfile.website && (
                        <div className="flex items-center text-muted-foreground">
                        <LinkIcon className="size-4 mr-2" />
                        <a href={userProfile.website.startsWith("http") ? userProfile.website : `https://${userProfile.website}`}
                            className="hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {userProfile.website}
                        </a>
                        </div>
                    )}
                    <div className="flex items-center text-muted-foreground">
                        <CalendarIcon className="size-4 mr-2" />
                        Joined {formattedDate}
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b h-auto p-2 rounded-md">
            <TabsTrigger
              value="posts"
              className="px-6 font-semibold gap-2"
            >
              <FileTextIcon className="size-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="px-6 font-semibold gap-2"
            >
              <HeartIcon className="size-4" />
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} dbUserId={userProfile.id} isOwnPost={isOwnProfile}/>)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts yet</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-6">
            <div className="space-y-6">
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => <PostCard key={post.id} post={post} dbUserId={userProfile.id} isOwnPost={isOwnProfile} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">No liked posts to show</div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Your personal website"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ProfilePage
