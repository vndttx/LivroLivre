package com.livrolivre.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    private String id;
    private String email;
    private String nome;
    private String nomeUsuario;
    private String senha;

    public Usuario(String email, String nomeUsuario, String senha) {
        this.email = email;
        this.nome = nomeUsuario;
        this.nomeUsuario = nomeUsuario;
        this.senha = senha;
    }
}