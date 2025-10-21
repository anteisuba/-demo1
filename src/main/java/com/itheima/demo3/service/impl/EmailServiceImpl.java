package com.itheima.demo3.service.impl;

import com.itheima.demo3.entity.User;
import com.itheima.demo3.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendBaseUrl;
    private final boolean mailEnabled;

    public EmailServiceImpl(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String fromAddress,
            @Value("${app.frontend-base-url}") String frontendBaseUrl,
            @Value("${app.mail.enabled:true}") boolean mailEnabled
    ) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
        this.mailEnabled = mailEnabled;
    }

    @Override
    public void sendPasswordResetEmail(User user) {
        String resetLink = frontendBaseUrl + "/reset-password?token=" + user.getResetToken();

        if (!mailEnabled) {
            log.info("Mail sending disabled by configuration. Reset link for {}: {}", user.getEmail(), resetLink);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("密码重置请求");
        message.setText(buildMessageBody(user.getUsername(), resetLink));

        try {
            mailSender.send(message);
            log.info("Password reset email sent to {} with link {}", user.getEmail(), resetLink);
        } catch (MailException ex) {
            log.error("Failed to send password reset email to {}", user.getEmail(), ex);
            throw new IllegalStateException("发送重置邮件失败，请稍后重试");
        }
    }

    @Override
    public void sendOtpEmail(User user, String code) {
        if (!mailEnabled) {
            log.info("Mail sending disabled by configuration. OTP for {}: {}", user.getEmail(), code);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("密码重置验证码");
        message.setText(buildOtpMessageBody(user.getUsername(), code));

        try {
            mailSender.send(message);
            log.info("Password reset OTP sent to {}", user.getEmail());
        } catch (MailException ex) {
            log.error("Failed to send password reset otp to {}", user.getEmail(), ex);
            throw new IllegalStateException("发送验证码失败，请稍后重试");
        }
    }

    private String buildMessageBody(String username, String resetLink) {
        StringBuilder builder = new StringBuilder();
        builder.append("您好 ").append(username).append("，").append(System.lineSeparator());
        builder.append("我们收到了您的密码重置请求，请点击以下链接完成密码修改：").append(System.lineSeparator());
        builder.append(resetLink).append(System.lineSeparator()).append(System.lineSeparator());
        builder.append("如果这不是您的操作，请忽略该邮件，原密码仍然有效。").append(System.lineSeparator());
        builder.append("此链接仅在 30 分钟内有效。");
        return builder.toString();
    }

    private String buildOtpMessageBody(String username, String code) {
        StringBuilder builder = new StringBuilder();
        builder.append("您好 ").append(username).append("，").append(System.lineSeparator());
        builder.append("您的密码重置验证码为：").append(code).append(System.lineSeparator());
        builder.append("验证码有效期为 5 分钟，请勿泄露给他人。").append(System.lineSeparator());
        builder.append("如果这不是您的操作，请忽略该邮件。");
        return builder.toString();
    }
}
