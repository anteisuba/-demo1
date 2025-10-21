package com.itheima.demo3.service.impl;

import com.itheima.demo3.entity.PasswordResetOtp;
import com.itheima.demo3.entity.User;
import com.itheima.demo3.repository.PasswordResetOtpRepository;
import com.itheima.demo3.repository.UserRepository;
import com.itheima.demo3.service.EmailService;
import com.itheima.demo3.service.OtpService;
import com.itheima.demo3.service.UserService;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OtpServiceImpl implements OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 5;
    private static final int OTP_EXPIRY_MINUTES = 5;

    private final PasswordResetOtpRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserService userService;

    public OtpServiceImpl(
            PasswordResetOtpRepository otpRepository,
            UserRepository userRepository,
            EmailService emailService,
            UserService userService
    ) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.userService = userService;
    }

    @Transactional
    @Override
    public void requestOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("该邮箱未注册账号"));

        otpRepository.deleteByEmail(email);

        PasswordResetOtp otp = new PasswordResetOtp();
        otp.setEmail(email);
        otp.setCode(generateNumericOtp());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otp.setAttempts(0);
        otp.setVerified(false);
        otpRepository.save(otp);

        emailService.sendOtpEmail(user, otp.getCode());
    }

    @Transactional
    @Override
    public void verifyOtp(String email, String code) {
        PasswordResetOtp otp = otpRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("请先获取验证码"));

        if (otp.isVerified()) {
            otpRepository.delete(otp);
            throw new IllegalArgumentException("验证码已被使用，请重新获取");
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            otpRepository.delete(otp);
            throw new IllegalArgumentException("验证码已过期，请重新获取");
        }

        if (!otp.getCode().equalsIgnoreCase(code)) {
            int attempts = otp.getAttempts() + 1;
            otp.setAttempts(attempts);
            otpRepository.save(otp);
            if (attempts >= MAX_ATTEMPTS) {
                otpRepository.delete(otp);
                throw new IllegalArgumentException("验证码错误次数过多，请重新获取");
            }
            throw new IllegalArgumentException("验证码不正确，请核对后再试");
        }

        otp.setVerified(true);
        otpRepository.save(otp);
        otpRepository.delete(otp);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("该邮箱未注册账号"));
        userService.sendPasswordResetLink(user);
    }

    private String generateNumericOtp() {
        int value = RANDOM.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", value);
    }
}
