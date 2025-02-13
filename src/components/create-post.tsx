import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card';

function CreatePost() {
    const { user } = useUser();
    const [ content, setContent ] = useState("");
    const [ imageUrl, setImageUr ] = useState("");
    const [ isPosting, setIsPosting ] = useState("");
    const [showImageUpload, setShowImageUpload] = useState(false);

    const handleSubmit = () => {};

    return (
        <Card className='mb-6'>
            <CardContent className='pt-6'>

            </CardContent>
        </Card>
    )
}

export default CreatePost
