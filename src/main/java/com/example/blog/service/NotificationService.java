package com.example.blog.service;

import com.example.blog.model.Notification;
import com.example.blog.model.NotificationType;
import com.example.blog.model.User;
import com.example.blog.repository.NotificationRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void createNotification(User recipient, User actor, NotificationType type, String optionalContext) {
        String message = "";
        switch (type) {
            case LIKE:
                message = actor.getUsername() + " liked your post.";
                break;
            case FOLLOW:
                message = actor.getUsername() + " started following you.";
                break;
            case COMMENT:
                message = actor.getUsername() + " commented on your post.";
                break;
        }

        Notification notification = Notification.builder()
                .user(recipient)
                .message(message)
                .type(type)
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return notificationRepository.findByUserIdOrderByTimestampDesc(user.getId());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return notificationRepository.countByUserIdAndReadFalse(user.getId());
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAsUnread(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setRead(false);
        notificationRepository.save(notification);
    }
}
