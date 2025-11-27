package com.livrolivre.service;

import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusLivro;
import com.livrolivre.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LivroService {

    @Autowired
    private LivroRepository livroRepository;

    public List<Livro> listarTodos() {
        return livroRepository.findByStatus(StatusLivro.DISPONIVEL);
    }

    public Optional<Livro> buscarPorId(Long id) {
        return livroRepository.findById(id);
    }

    public Livro salvar(Livro livro) {
        return livroRepository.save(livro);
    }

    public void remover(Long id) {
        livroRepository.deleteById(id);
    }

    public List<Livro> buscarPorProprietario(Usuario proprietario) {
        return livroRepository.findByProprietario(proprietario);
    }
}