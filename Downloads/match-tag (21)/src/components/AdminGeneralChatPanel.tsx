"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, 
  Send, 
  UserX, 
  UserCheck, 
  Trash2, 
  AlertCircle,
  MessageCircle
} from "lucide-react"
import { useAdminGeneralChat } from "@/src/hooks/useAdminGeneralChat"
import { useT } from "@/src/hooks/useTranslation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AdminGeneralChatPanelProps {
  barId: string
}

export function AdminGeneralChatPanel({ barId }: AdminGeneralChatPanelProps) {
  const [announcement, setAnnouncement] = useState("")
  const [banReason, setBanReason] = useState("")
  const [userToBan, setUserToBan] = useState<any>(null)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const t = useT()

  const {
    messages,
    users,
    bannedUsers,
    loading,
    error,
    sendAdminAnnouncement,
    banUser,
    unbanUser,
    clearMessages
  } = useAdminGeneralChat(barId)

  // Debug logs
  console.log("AdminGeneralChatPanel - Users:", users)
  console.log("AdminGeneralChatPanel - Messages:", messages)
  console.log("AdminGeneralChatPanel - Banned Users:", bannedUsers)
  console.log("AdminGeneralChatPanel - BarId:", barId)

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return

    const success = await sendAdminAnnouncement(announcement)
    if (success) {
      setAnnouncement("")
    }
  }

  const handleBanUser = (user: any) => {
    setUserToBan(user)
    setShowBanDialog(true)
  }

  const confirmBanUser = async () => {
    if (!userToBan) return

    const success = await banUser(userToBan, banReason || undefined)
    if (success) {
      setShowBanDialog(false)
      setUserToBan(null)
      setBanReason("")
    }
  }

  const handleUnbanUser = async (bannedUserId: string) => {
    await unbanUser(bannedUserId)
  }

  const handleClearMessages = async () => {
    const success = await clearMessages()
    if (success) {
      setShowClearDialog(false)
    }
  }

  const getMessageStyle = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-purple-100 border-l-4 border-purple-500 text-purple-900"
      case "system":
        return "bg-gray-100 text-center text-gray-800"
      default:
        return "bg-blue-800 text-white"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t("admin.generalChatAdminPanel")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Messages */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t("admin.chatMessages")}</h3>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowClearDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("admin.clearChat")}
                </Button>
              </div>

              <Card className="h-[400px] flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">{t("admin.loadingMessages")}</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">{t("admin.noMessagesYet")}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${getMessageStyle(msg.type)}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {msg.avatar && (
                                  <span className="text-lg">{msg.avatar}</span>
                                )}
                                <span className="font-semibold text-sm">
                                  {msg.username}
                                </span>
                                {msg.tableNumber && (
                                  <Badge variant="outline" className="text-xs">
{t("admin.table")} {msg.tableNumber}
                                  </Badge>
                                )}
                                {msg.type === "admin" && (
                                  <Badge className="text-xs bg-purple-500">Admin</Badge>
                                )}
                              </div>
                              <p className="text-sm">{msg.message}</p>
                              <span className="text-xs text-muted-foreground">
                                {msg.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </Card>

              {/* Announcement Input */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("admin.sendAnnouncementAsAdmin")}
                    </label>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={t("admin.writeAnnouncementHere")}
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        rows={2}
                      />
                      <Button
                        onClick={handleSendAnnouncement}
                        disabled={!announcement.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Panel */}
            <div className="space-y-4">
              {/* Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
{t("admin.activeUsers")} ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    {users.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-1">
                          {t("admin.noActiveUsers")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("admin.usersWillAppearWhenJoinChat")}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {user.avatar && (
                                <span className="text-lg">{user.avatar}</span>
                              )}
                              <div>
                                <p className="font-medium text-sm">{user.username}</p>
                                <p className="text-xs text-muted-foreground">
{t("admin.table")} {user.tableNumber}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBanUser(user)}
                            >
                              <UserX className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Banned Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UserX className="h-4 w-4" />
                    {t("admin.bannedUsers")} ({bannedUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    {bannedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {t("admin.noBannedUsers")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {bannedUsers.map((banned) => (
                          <div
                            key={banned.id}
                            className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {banned.avatar && (
                                <span className="text-lg">{banned.avatar}</span>
                              )}
                              <div>
                                <p className="font-medium text-sm">{banned.username}</p>
                                <p className="text-xs text-muted-foreground">
{t("admin.table")} {banned.tableNumber}
                                </p>
                                {banned.reason && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {banned.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnbanUser(banned.id)}
                            >
                              <UserCheck className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.banUser")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.areYouSureBanUser")} <strong>{userToBan?.username}</strong> {t("admin.fromChat")}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
{t("admin.reasonOptional")}
            </label>
            <Input
              placeholder={t("admin.reasonExample")}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowBanDialog(false)
              setUserToBan(null)
              setBanReason("")
            }}>
              {t("admin.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBanUser}
              className="bg-red-600 hover:bg-red-700"
            >
{t("admin.banUser")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Messages Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.clearMessages")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.areYouSureClearAllMessages")} {t("admin.thisActionCannotBeUndone")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearMessages}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("admin.clearChat")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
