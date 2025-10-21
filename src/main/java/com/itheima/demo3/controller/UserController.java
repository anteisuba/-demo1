package com.itheima.demo3.controller;

import com.itheima.demo3.dto.UserResponse;
import com.itheima.demo3.entity.User;
import com.itheima.demo3.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<UserResponse> getUser(@PathVariable("identifier") String identifier) {
        User user = userService.findByUsername(identifier)
                .or(() -> userService.findByEmail(identifier))
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
