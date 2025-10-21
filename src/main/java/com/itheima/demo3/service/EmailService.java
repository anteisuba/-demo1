package com.itheima.demo3.service;

import com.itheima.demo3.entity.User;

public interface EmailService {

    void sendPasswordResetEmail(User user);
}
