package com.example.blog.service;

import com.example.blog.dto.PageResponse;
import com.example.blog.dto.PostRequest;
import com.example.blog.dto.PostResponse;
import com.example.blog.model.Post;
import com.example.blog.model.User;
import com.example.blog.repository.PostRepository;
import com.example.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

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

    public PageResponse<PostResponse> getAllPosts(String requestingUsername, int page, int size) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Post> postsPage;
        
        if (requester.getRole().name().equals("ADMIN")) {
            postsPage = postRepository.findAllByOrderByTimestampDesc(pageRequest);
        } else {
            postsPage = postRepository.findAllVisibleByOrderByTimestampDesc(pageRequest);
        }

        List<PostResponse> content = postsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return new PageResponse<>(content, postsPage.getNumber(), postsPage.getSize(), postsPage.getTotalElements(), postsPage.getTotalPages(), postsPage.isLast());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<PostResponse> getPostsByUser(Long userId, String requestingUsername) {
        User requester = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        boolean isAdmin = requester.getRole().name().equals("ADMIN");

        return postRepository.findByUserIdOrderByTimestampDesc(userId).stream()
                .filter(post -> !post.isHidden() || isAdmin || post.getUser().getId().equals(requester.getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
        postRepository.delete(post);
    }

    public PostResponse updatePost(Long postId, PostRequest request, String username) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only edit your own posts");
        }

        String newContent = request.getContent();
        String mediaUrl = request.getMediaUrl() != null ? request.getMediaUrl() : post.getMediaUrl();

        if ((newContent == null || newContent.trim().isEmpty()) && (mediaUrl == null || mediaUrl.isEmpty())) {
            throw new RuntimeException("Post must have either text content or media");
        }

        post.setContent(newContent);
        if (request.getMediaUrl() != null) {
            post.setMediaUrl(request.getMediaUrl());
            post.setMediaType(request.getMediaType());
        }
        
        Post savedPost = postRepository.save(post);
        return mapToResponse(savedPost);
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
