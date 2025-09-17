package com.livrolivreapp.controller;

import com.livrolivreapp.model.Livro;
import com.livrolivreapp.service.LivroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/livros")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @GetMapping
    public List<Livro> listar() {
        return livroService.listarTodos();
    }

    @PostMapping
    public Livro adicionar(@RequestBody Livro livro) {
        return livroService.salvar(livro);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Livro> buscarPorId(@PathVariable Long id) {
        return livroService.buscarPorId(id)
                .map(livro -> ResponseEntity.ok().body(livro))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/decrementar-estoque/{id}")
    public ResponseEntity<Livro> decrementarEstoque(@PathVariable Long id) {
        return livroService.decrementarEstoque(id)
                .map(livro -> ResponseEntity.ok().body(livro))
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/incrementar-estoque/{id}")
    public ResponseEntity<Livro> incrementarEstoque(@PathVariable Long id) {
        return livroService.incrementarEstoque(id)
                .map(livro -> ResponseEntity.ok().body(livro))
                .orElse(ResponseEntity.notFound().build());
    }
}