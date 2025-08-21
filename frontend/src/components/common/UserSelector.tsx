import React, { useState, useEffect } from 'react';
import { Search, User, Check } from 'lucide-react';
import { userService } from '../../services/user.service';
import { TaskUser } from '../../types/task';
import { useAuth } from '../../contexts/AuthContext';

interface UserSelectorProps {
  selectedUserId?: string;
  onSelect: (userId: string, user: TaskUser) => void;
  placeholder?: string;
  className?: string;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUserId,
  onSelect,
  placeholder = "Search users...",
  className = ""
}) => {
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<TaskUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TaskUser | null>(null);

  useEffect(() => {
    if (selectedUserId && currentUser) {
      if (selectedUserId === currentUser.id) {
        setSelectedUser({
          id: currentUser.id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email
        });
      } else {
        // Find user in the list or fetch by ID
        const foundUser = users.find(u => u.id === selectedUserId);
        if (foundUser) {
          setSelectedUser(foundUser);
        }
      }
    }
  }, [selectedUserId, currentUser, users]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (isOpen) {
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(searchTerm);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: TaskUser) => {
    setSelectedUser(user);
    onSelect(user.id, user);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayName = selectedUser 
    ? `${selectedUser.firstName} ${selectedUser.lastName}`
    : placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="form-input flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <span className={selectedUser ? 'text-gray-900' : 'text-gray-400'}>
            {displayName}
          </span>
        </div>
        <Search className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="spinner w-4 h-4 border-gray-400 mx-auto"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No users found
              </div>
            ) : (
              <>
                {/* Current user always first */}
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => handleSelectUser({
                      id: currentUser.id,
                      firstName: currentUser.firstName,
                      lastName: currentUser.lastName,
                      email: currentUser.email
                    })}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {currentUser.firstName} {currentUser.lastName} (Me)
                        </div>
                        <div className="text-xs text-gray-500">{currentUser.email}</div>
                      </div>
                    </div>
                    {selectedUserId === currentUser.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                )}

                {/* Other users */}
                {users.filter(u => u.id !== currentUser?.id).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    {selectedUserId === user.id && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
