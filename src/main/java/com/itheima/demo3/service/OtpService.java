package com.itheima.demo3.service;

public interface OtpService {

    void requestOtp(String email);

    void verifyOtp(String email, String code);
}
