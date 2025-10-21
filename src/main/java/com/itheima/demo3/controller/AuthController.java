package com.itheima.demo3.controller;

import com.itheima.demo3.dto.ApiMessage;
import com.itheima.demo3.dto.ForgotPasswordForm;
import com.itheima.demo3.dto.LoginRequest;
import com.itheima.demo3.dto.LoginResponse;
import com.itheima.demo3.dto.OtpVerificationRequest;
import com.itheima.demo3.dto.RegistrationForm;
import com.itheima.demo3.dto.ResetPasswordForm;
import com.itheima.demo3.dto.UserResponse;
import com.itheima.demo3.entity.User;
import com.itheima.demo3.service.OtpService;
import com.itheima.demo3.service.UserService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;

    public AuthController(UserService userService, OtpService otpService) {
        this.userService = userService;
        this.otpService = otpService;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegistrationForm form) {
        User user = userService.registerUser(form);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponse("注册成功", UserResponse.from(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getIdentifier(), request.getPassword())
                .orElseThrow(() -> new IllegalArgumentException("用户名或密码错误"));
        return ResponseEntity.ok(new LoginResponse("登录成功", UserResponse.from(user)));
    }

    @PostMapping("/forgot-password/request-otp")
    public ResponseEntity<ApiMessage> requestOtp(@Valid @RequestBody ForgotPasswordForm form) {
        otpService.requestOtp(form.getEmail());
        return ResponseEntity.ok(new ApiMessage("验证码已发送到邮箱"));
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<ApiMessage> verifyOtp(@Valid @RequestBody OtpVerificationRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getCode());
        return ResponseEntity.ok(new ApiMessage("验证码验证成功，重置链接已发送到邮箱"));
    }

    @GetMapping("/reset-password/validate")
    public ResponseEntity<ApiMessage> validateResetToken(@RequestParam("token") String token) {
        return userService.findByResetToken(token)
                .filter(user -> user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isAfter(LocalDateTime.now()))
                .map(user -> ResponseEntity.ok(new ApiMessage("重置链接有效")))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiMessage("重置链接无效或已过期")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiMessage> resetPassword(@Valid @RequestBody ResetPasswordForm form) {
        userService.resetPassword(form);
        return ResponseEntity.ok(new ApiMessage("密码重置成功，请重新登录"));
    }
}
