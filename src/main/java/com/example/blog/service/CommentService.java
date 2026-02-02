package com.example.blog.service;

import com.example.blog.dto.CommentRequest;
import com.example.blog.dto.CommentResponse;
import com.example.blog.model.Comment;
import com.example.blog.model.NotificationType;
import com.example.blog.model.Post;
import com.example.blog.model.User;
import com.example.blog.repository.CommentRepository;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CommentResponse addComment(CommentRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.isHidden()) {
            throw new RuntimeException("Comments are disabled for hidden posts");
        }

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);

        if (!post.getUser().getUsername().equals(username)) {
            notificationService.createNotification(post.getUser(), user, NotificationType.COMMENT, null);
        }

        return mapToResponse(savedComment);
    }

    public List<CommentResponse> getCommentsForPost(Long postId) {
        return commentRepository.findByPostIdOrderByTimestampAsc(postId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        boolean isAdmin = requester.getRole().name().equals("ADMIN");

        if (!comment.getUser().getUsername().equals(username) && !isAdmin) {
            throw new RuntimeException("You can only delete your own comments");
        }
        
        if (comment.getPost().isHidden() && !isAdmin) {
            throw new RuntimeException("You cannot delete comments on a hidden post");
        }
        
        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .timestamp(comment.getTimestamp())
                .username(comment.getUser().getUsername())
                .userId(comment.getUser().getId())
                .userProfilePictureUrl(comment.getUser().getProfilePictureUrl())
                .build();
    }
}
