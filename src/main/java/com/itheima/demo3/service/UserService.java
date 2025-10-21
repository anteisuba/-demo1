package com.itheima.demo3.service;

import com.itheima.demo3.dto.RegistrationForm;
import com.itheima.demo3.dto.ResetPasswordForm;
import com.itheima.demo3.entity.User;
import java.util.Optional;

public interface UserService {

    User registerUser(RegistrationForm form);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByResetToken(String token);

    void sendPasswordResetLink(User user);

    void resetPassword(ResetPasswordForm form);

    Optional<User> authenticate(String identifier, String rawPassword);
}
