
package com.livrolivre.controller.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String nomeUsuario;
    private String senha;
}