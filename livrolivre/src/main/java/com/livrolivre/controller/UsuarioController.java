package com.livrolivre.controller;

import com.livrolivre.model.Usuario;
import com.livrolivre.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public Usuario adicionar(@RequestBody Usuario usuario) {
        return usuarioService.salvar(usuario);
    }
}