import { getPostsByUserId, getProfileByUsername, getUserLikedPosts, isFollowing } from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ProfilePage from "./profile-page";

async function Profile({params}: {params: {username: string}}) {
    const user = await getProfileByUsername(params.username);
    if (!user) notFound();

    const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
        getPostsByUserId(user.id),
        getUserLikedPosts(user.id),
        isFollowing(user.id),
    ]);

  return (
    <ProfilePage 
        user={user} 
        posts={posts} 
        likedPosts={likedPosts} 
        isFollowing={isCurrentUserFollowing}
    />
  )
}

export default Profile
