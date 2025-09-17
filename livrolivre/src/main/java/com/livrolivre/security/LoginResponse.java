package com.livrolivre.security;

public class LoginResponse {
    private String token;
    private Long usuarioId;
    private String nomeUsuario;

    public LoginResponse(String token, Long usuarioId, String nomeUsuario) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.nomeUsuario = nomeUsuario;
    }

    // Getters
    public String getToken() {
        return token;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getNomeUsuario() {
        return nomeUsuario;
    }
}