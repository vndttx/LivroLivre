
package com.livrolivre.controller.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String nome;
    private String senha;
}