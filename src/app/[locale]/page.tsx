import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import WhoToFollow from "@/components/who-to-follow";

export default async function Home() {
  const user = true;
  const post = await getPosts();  
  const dbUserId = await getDbUserId();
  
  return (
    <div className='grid grid-cols-1 lg:grid-cols-10 gap-6' >
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}
        {post.map((post) => (
          <PostCard key={post.id} post={post} dbUserId={dbUserId} isOwnPost={post.authorId == dbUserId} />
        ))}
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <WhoToFollow />
      </div>
    </div>
  );
}
