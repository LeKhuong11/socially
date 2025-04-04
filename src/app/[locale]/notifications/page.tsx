"use client"

import { getNotifications, markNotificationsAsRead } from "@/actions/notifications.action";
import { NotificationLoading } from "@/components/notification-loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type Notification = Notifications[number];

const getNotificationType = (type: string) => {
    switch (type) {
      case "LIKE":
        return <HeartIcon className="size-4 text-red-500" />;
      case "COMMENT":
        return <MessageCircleIcon className="size-4 text-blue-500" />;
      case "FOLLOW":
        return <UserPlusIcon className="size-4 text-green-500" />;
      default:
        return null;
    }
  };

function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations('Notifications');

    useEffect(() => {
        const fetchNotifications = async () => {
            setIsLoading(true);
            try {
                const data = await getNotifications();
                setNotifications(data);

                const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
                if (unreadIds.length > 0) {
                    await markNotificationsAsRead(unreadIds);
                }
            } catch {
                toast.error("Failed to fetch notifications");
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    if (isLoading) return <NotificationLoading />
    
  return (
    <div className="space-y-4">
      <Card className="h-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{t('Notifications')}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {notifications.filter((n) => !n.read).length} {t('Unread')}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea>
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">{t('No notifications yet')}</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <Avatar className="mt-1">
                    <AvatarImage src={notification.creator.image || "/images/avatar-default.jpg"} />
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getNotificationType(notification.type)}
                      <span>
                        <span className="font-medium">
                          {notification.creator.name ?? notification.creator.username}
                        </span>{" "}
                        {notification.type === "FOLLOW"
                          ? t('Start following you')
                          : notification.type === "LIKE"
                          ? t('Like your post')
                          : t('Commented on your post')}
                      </span>
                    </div>

                    {notification.post &&
                      (notification.type === "LIKE" || notification.type === "COMMENT") && (
                        <div className="pl-6 space-y-2">
                          <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/50 mt-2">
                            <p>{notification.post.content}</p>
                            {notification.post.image && (
                              <Image
                                src={notification.post.image}
                                alt="Post content"
                                className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                                width={200}
                                height={200}
                              />
                            )}
                          </div>
                          
                          {notification.type === "COMMENT" && notification.comment && (
                            <div className="mx-4 text-sm p-2 bg-accent/80 rounded-md">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 \">
                                  <span className="font-bold text-sm">{notification.creator.name ?? notification.creator.username}</span>
                                </div>
                                <p className="text-sm font-thin break-words">{notification.comment.content}</p>
                            </div>
                          )}
                        </div>
                      )}

                    <p className="text-sm text-muted-foreground pl-6">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default Notifications
