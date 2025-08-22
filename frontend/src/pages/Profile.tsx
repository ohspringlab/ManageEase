import { useContext, useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User, Mail, Edit, Save, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext"; // adjust path
import api from "../api/api";
import { format } from "date-fns";

type UserDetails = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  tasksCompleted: number;
  activeTasks: number;
};

export default function Profile() {
  const { user } = useContext(AuthContext); // ✅ get logged in user
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserDetails>(
    {} as UserDetails
  );
  const [editData, setEditData] = useState<UserDetails>({} as UserDetails);

  // Fetch profile
  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${user.id}`);
        setProfileData(res.data);
        setEditData(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/users/${profileData._id}`, editData);
      setProfileData(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  if (loading && !profileData) {
    return <p className="text-muted-foreground">Loading profile...</p>;
  }

  if (!profileData) {
    return <p className="text-red-500">Failed to load profile</p>;
  }

  const stats = [
    {
      label: "Tasks Completed",
      value: profileData.tasksCompleted,
      color: "text-success",
    },
    {
      label: "Active Tasks",
      value: profileData.activeTasks,
      color: "text-primary",
    },
    {
      label: "Member Since",
      value: profileData.createdAt
        ? format(new Date(profileData.createdAt), "dd MMM yyyy, hh:mm a")
        : "—",
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update your personal details below."
                  : "Your account details and information."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                      {profileData?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{profileData.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <div className="px-3 py-2 bg-muted rounded-md">
                      {profileData.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="px-3 py-2 bg-muted rounded-md">
                    {profileData.email}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Your Stats</CardTitle>
              <CardDescription>Overview of your activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className={`font-semibold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
