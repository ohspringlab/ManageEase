import React from 'react';
import { User, UserCheck } from 'lucide-react';
import { TaskUser } from '../../types/task';
import { useAuth } from '../../contexts/AuthContext';

interface TaskAssignmentBadgeProps {
  creator: TaskUser;
  assignee: TaskUser;
  showCreator?: boolean;
  size?: 'sm' | 'md';
}

export const TaskAssignmentBadge: React.FC<TaskAssignmentBadgeProps> = ({
  creator,
  assignee,
  showCreator = false,
  size = 'sm'
}) => {
  const { user: currentUser } = useAuth();
  
  // Return null if required data is missing
  if (!creator || !assignee || !currentUser) {
    return null;
  }
  
  const isAssignedToMe = currentUser.id === assignee.id;
  const isCreatedByMe = currentUser.id === creator.id;
  const isSelfAssigned = creator.id === assignee.id;

  const avatarSize = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  // Safe name extraction with fallbacks
  const getDisplayName = (user: TaskUser, isCurrent: boolean = false) => {
    if (isCurrent) return 'Me';
    if (!user.firstName && !user.lastName) return 'Unknown User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  const getInitials = (user: TaskUser) => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??';
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Assignee */}
      <div className="flex items-center space-x-1">
        <div className={`${avatarSize} rounded-full flex items-center justify-center text-white font-medium ${
          isAssignedToMe ? 'bg-blue-500' : 'bg-gray-500'
        }`}>
          {getInitials(assignee)}
        </div>
        <div className="flex flex-col">
          <span className={`${textSize} font-medium text-gray-900`}>
            {getDisplayName(assignee, isAssignedToMe)}
          </span>
          {!isSelfAssigned && (
            <span className={`${size === 'sm' ? 'text-xs' : 'text-xs'} text-gray-500 flex items-center`}>
              <UserCheck className="w-3 h-3 mr-1" />
              Assignee
            </span>
          )}
        </div>
      </div>

      {/* Show creator if different from assignee */}
      {showCreator && !isSelfAssigned && (
        <>
          <span className="text-gray-300">•</span>
          <div className="flex items-center space-x-1">
            <div className={`${avatarSize} rounded-full flex items-center justify-center text-white font-medium ${
              isCreatedByMe ? 'bg-green-500' : 'bg-gray-400'
            }`}>
              {getInitials(creator)}
            </div>
            <div className="flex flex-col">
              <span className={`${textSize} font-medium text-gray-700`}>
                {getDisplayName(creator, isCreatedByMe)}
              </span>
              <span className={`${size === 'sm' ? 'text-xs' : 'text-xs'} text-gray-500 flex items-center`}>
                <User className="w-3 h-3 mr-1" />
                Creator
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
