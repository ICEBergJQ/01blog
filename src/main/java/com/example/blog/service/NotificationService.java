package com.example.blog.service;

import com.example.blog.model.Notification;
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

    public void createNotification(User recipient, String message) {
        Notification notification = Notification.builder()
                .user(recipient)
                .message(message)
                .build();
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return notificationRepository.findByUserIdOrderByTimestampDesc(user.getId());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElseThrow();
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
