package com.itheima.demo3.service.impl;

import com.itheima.demo3.dto.ForgotPasswordForm;
import com.itheima.demo3.dto.RegistrationForm;
import com.itheima.demo3.dto.ResetPasswordForm;
import com.itheima.demo3.entity.User;
import com.itheima.demo3.repository.UserRepository;
import com.itheima.demo3.service.UserService;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    @Override
    public User registerUser(RegistrationForm form) {
        if (!form.getPassword().equals(form.getConfirmPassword())) {
            throw new IllegalArgumentException("两次输入的密码不一致");
        }

        userRepository.findByUsername(form.getUsername())
                .ifPresent(user -> {
                    throw new IllegalArgumentException("用户名已存在");
                });

        userRepository.findByEmail(form.getEmail())
                .ifPresent(user -> {
                    throw new IllegalArgumentException("邮箱已注册");
                });

        User user = new User();
        user.setUsername(form.getUsername());
        user.setEmail(form.getEmail());
        user.setPassword(passwordEncoder.encode(form.getPassword()));
        userRepository.save(user);
        return user;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findByResetToken(String token) {
        return userRepository.findByResetToken(token);
    }

    @Transactional
    @Override
    public void initiatePasswordReset(ForgotPasswordForm form) {
        User user = userRepository.findByEmail(form.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("该邮箱未注册账号"));

        String token = UUID.randomUUID().toString().replace("-", "");
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        // 实际项目中应该发送邮件或短信，这里先打印日志方便调试
        log.info("Password reset link for {}: http://localhost:3000/reset-password?token={}", user.getEmail(), token);
    }

    @Transactional
    @Override
    public void resetPassword(ResetPasswordForm form) {
        if (!form.getPassword().equals(form.getConfirmPassword())) {
            throw new IllegalArgumentException("两次输入的密码不一致");
        }

        User user = userRepository.findByResetToken(form.getToken())
                .orElseThrow(() -> new IllegalArgumentException("重置链接无效"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("重置链接已过期");
        }

        user.setPassword(passwordEncoder.encode(form.getPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Override
    public Optional<User> authenticate(String identifier, String rawPassword) {
        return findByUsername(identifier)
                .or(() -> findByEmail(identifier))
                .filter(user -> passwordEncoder.matches(rawPassword, user.getPassword()));
    }
}
