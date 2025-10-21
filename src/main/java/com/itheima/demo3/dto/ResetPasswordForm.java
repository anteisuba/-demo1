package com.itheima.demo3.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordForm {

    @NotBlank(message = "重置令牌不能为空")
    private String token;

    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 64, message = "密码长度应在6到64之间")
    private String password;

    @NotBlank(message = "确认密码不能为空")
    private String confirmPassword;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
