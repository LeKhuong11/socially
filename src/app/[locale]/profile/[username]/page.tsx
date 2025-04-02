import { getPostsByUserId, getProfileByUsername, getUserLikedPosts, isFollowing } from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ProfilePage from "./profile-page";

async function Profile({params}: {params: {username: string}}) {
    const userProfile = await getProfileByUsername(params.username);
    if (!userProfile) notFound();

    const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
        getPostsByUserId(userProfile.id),
        getUserLikedPosts(userProfile.id),
        isFollowing(userProfile.id),
    ]);

  return (
    <ProfilePage 
        userProfile={userProfile} 
        posts={posts} 
        likedPosts={likedPosts} 
        isFollowing={isCurrentUserFollowing}
    />
  )
}

export default Profile
