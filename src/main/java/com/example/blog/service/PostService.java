package com.example.blog.service;

import com.example.blog.dto.CursorResponse;
import com.example.blog.dto.PostRequest;
import com.example.blog.dto.PostResponse;
import com.example.blog.model.Post;
import com.example.blog.model.User;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FileService fileService;

    public PostResponse createPost(PostRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Post post = Post.builder()
                .content(request.getContent())
                .mediaUrl(request.getMediaUrl())
                .mediaType(request.getMediaType())
                .user(user)
                .build();

        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    public CursorResponse<PostResponse> getAllPosts(String requestingUsername, Long cursor, int size) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(0, size + 1);
        List<Post> posts;
        
        if (requester.getRole().name().equals("ADMIN")) {
            posts = postRepository.findAllPostsCursor(cursor, pageable);
        } else {
            posts = postRepository.findVisiblePostsCursor(cursor, pageable);
        }

        return buildCursorResponse(posts, size);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public CursorResponse<PostResponse> getPostsByUser(Long userId, String requestingUsername, Long cursor, int size) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        boolean isAdmin = requester.getRole().name().equals("ADMIN");

        Pageable pageable = PageRequest.of(0, size + 1);
        List<Post> posts = postRepository.findUserPostsCursor(userId, cursor, pageable);
        
        if (!isAdmin) {
             posts = posts.stream().filter(p -> !p.isHidden()).collect(Collectors.toList());
        }

        return buildCursorResponse(posts, size);
    }

    public void deletePost(Long postId, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean isOwner = post.getUser().getUsername().equals(username);

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("You can only delete your own posts");
        }
        
        if (post.isHidden() && !isAdmin) {
            throw new RuntimeException("You cannot delete a hidden post");
        }

        if (post.getMediaUrl() != null) {
            String[] urlParts = post.getMediaUrl().split("/");
            String filename = urlParts[urlParts.length - 1];
            fileService.deleteFile(filename);
        }
        
        postRepository.delete(post);
    }

    public PostResponse updatePost(Long postId, PostRequest request, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only edit your own posts");
        }
        
        if (post.isHidden()) {
            throw new RuntimeException("You cannot edit a hidden post");
        }

        String newContent = request.getContent();
        String mediaUrl = request.getMediaUrl() != null ? request.getMediaUrl() : post.getMediaUrl();

        if ((newContent == null || newContent.trim().isEmpty()) && (mediaUrl == null || mediaUrl.isEmpty())) {
            throw new RuntimeException("Post must have either text content or media");
        }

        // Delete old media if new media is provided
        if (request.getMediaUrl() != null && !request.getMediaUrl().equals(post.getMediaUrl()) && post.getMediaUrl() != null) {
            String[] urlParts = post.getMediaUrl().split("/");
            String filename = urlParts[urlParts.length - 1];
            fileService.deleteFile(filename);
        }

        post.setContent(newContent);
        post.setMediaUrl(request.getMediaUrl());
        post.setMediaType(request.getMediaType());
        
        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
    }

    private CursorResponse<PostResponse> buildCursorResponse(List<Post> posts, int size) {
        boolean hasMore = posts.size() > size;
        if (hasMore) {
            posts.remove(posts.size() - 1);
        }
        
        List<PostResponse> content = posts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        Long nextCursor = content.isEmpty() ? null : content.get(content.size() - 1).getId();
        
        return new CursorResponse<>(content, nextCursor, hasMore);
    }

    private PostResponse mapToResponse(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .timestamp(post.getTimestamp())
                .username(post.getUser().getUsername())
                .userId(post.getUser().getId())
                .userProfilePictureUrl(post.getUser().getProfilePictureUrl())
                .hidden(post.isHidden())
                .build();
    }
}