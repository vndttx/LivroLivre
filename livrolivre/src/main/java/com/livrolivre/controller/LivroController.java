package com.livrolivre.controller;

import com.livrolivre.model.Livro;
import com.livrolivre.service.LivroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
                .orElse(ResponseEntity.badRequest().build()); // .badRequest() é mais indicado para estoque esgotado
    }

    @PutMapping("/incrementar-estoque/{id}")
    public ResponseEntity<Livro> incrementarEstoque(@PathVariable Long id) {
        return livroService.incrementarEstoque(id, 1)
                .map(livro -> ResponseEntity.ok().body(livro))
                .orElse(ResponseEntity.notFound().build());
    }
}