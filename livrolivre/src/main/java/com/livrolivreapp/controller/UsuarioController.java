package com.livrolivreapp.controller;

import com.livrolivreapp.model.Usuario;
import com.livrolivreapp.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

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