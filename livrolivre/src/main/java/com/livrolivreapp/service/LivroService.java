package com.livrolivreapp.service;

import com.livrolivreapp.model.Livro;
import com.livrolivreapp.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LivroService {

    @Autowired
    private LivroRepository livroRepository;

    public List<Livro> listarTodos() {
        return livroRepository.findAll();
    }

    public Optional<Livro> buscarPorId(Long id) {
        return livroRepository.findById(id);
    }

    public Livro salvar(Livro livro) {
        return livroRepository.save(livro);
    }

    public void deletar(Long id) {
        livroRepository.deleteById(id);
    }

    public Optional<Livro> decrementarEstoque(Long id) {
        return livroRepository.findById(id).map(livro -> {
            if (livro.getEstoque() > 0) {
                livro.setEstoque(livro.getEstoque() - 1);
                return livroRepository.save(livro);
            }
            return null;
        });
    }

    public Optional<Livro> incrementarEstoque(Long id) {
        return livroRepository.findById(id).map(livro -> {
            livro.setEstoque(livro.getEstoque() + 1);
            return livroRepository.save(livro);
        });
    }
}