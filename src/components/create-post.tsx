'use client'

import React, { useState } from 'react'
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ImageIcon, Loader2Icon, SendIcon } from 'lucide-react';
import { createPost } from '@/actions/post.action';
import toast from "react-hot-toast";
import { useTranslations } from 'next-intl';
import UploadImage from './upload-image';
import { useAppContext } from '@/app/context-provider';

function CreatePost() {
    const { user } = useAppContext();
    const [ content, setContent ] = useState("");
    const [ imageUrl, setImageUrl ] = useState("");
    const [ isPosting, setIsPosting ] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);

    const t = useTranslations('Home');

    const handleSubmit = async () => {
        if (!content.trim() && !imageUrl) return;
    
        setIsPosting(true);
        try {
            const result = await createPost(content, imageUrl);
            if (result?.success) {
                // reset the form
                setContent("");
                setImageUrl("");
                setShowImageUpload(false);
        
                toast.success("Post created successfully");
            }
        } catch (error) {
          console.error("Failed to create post:", error);
          toast.error("Failed to create post");
        } finally {
          setIsPosting(false);
        }
      };

    return (
        <Card className='mb-6'>
            <CardContent className='pt-6'>
                <div className='space-y-4'>
                    <div className="space-x-4 flex">
                        <Avatar className="w-10 h-10">
                            <AvatarImage width={50} src={user?.image || '/images/avatar-default.jpg'} alt={user?.username || 'User Avatar'} />
                        </Avatar>
                        <Textarea 
                            placeholder={t('createPostPlaceholder')}
                            className='min-h-[100px] resize-none border-none forcus-visible:ring-0 p-0 text-base'
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isPosting}
                        />
                    </div>

                    {(showImageUpload || imageUrl) && (
                        <div className="border rounded-lg p-4">
                            <UploadImage
                                onUpload={(url) => {
                                    setImageUrl(url);
                                    if (!url) setShowImageUpload(false);
                                }}
                                value={imageUrl}
                                endpoint="imageUploader" 
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex space-x-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => setShowImageUpload(!showImageUpload)}
                            disabled={isPosting}
                        >
                            <ImageIcon className="size-4 mr-2" />
                            {t('photo')}
                        </Button>
                        </div>
                        <Button
                        className="flex items-center"
                        onClick={handleSubmit}
                        disabled={(!content.trim() && !imageUrl) || isPosting}
                        >
                        {isPosting ? (
                            <>
                                <Loader2Icon className="size-4 mr-2 animate-spin" />
                                {t('Posting')}...
                            </>
                        ) : (
                            <>
                                <SendIcon className="size-4 mr-2" />
                                {t('post')}
                            </>
                        )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CreatePost
