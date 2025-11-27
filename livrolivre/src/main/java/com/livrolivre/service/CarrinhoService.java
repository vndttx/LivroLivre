package com.livrolivre.service;

import com.livrolivre.model.Carrinho;
import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.CarrinhoRepository;
import com.livrolivre.repository.LivroRepository;
import com.livrolivre.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CarrinhoService {

    @Autowired
    private CarrinhoRepository carrinhoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LivroRepository livroRepository;

    public List<Carrinho> findByUsuarioId(Long usuarioId) {
        Optional<Usuario> usuario = usuarioRepository.findById(usuarioId);
        return usuario.map(carrinhoRepository::findByUsuario).orElse(null);
    }

    public Carrinho adicionarItemCarrinho(Long usuarioId, Long livroId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        Optional<Livro> livroOpt = livroRepository.findById(livroId);

        if (usuarioOpt.isPresent() && livroOpt.isPresent()) {
            Carrinho item = new Carrinho();
            item.setUsuario(usuarioOpt.get());
            item.setLivro(livroOpt.get());
            item.setQuantidade(1);
            return carrinhoRepository.save(item);
        }
        return null;
    }

    public boolean removerItemCarrinho(Long usuarioId, Long livroId) {
        // 1. Busca as entidades
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        Optional<Livro> livroOpt = livroRepository.findById(livroId);

        if (usuarioOpt.isEmpty() || livroOpt.isEmpty()) {
            return false;
        }

        // 2. Busca o item no carrinho usando o método findByUsuarioAndLivro (no Repository)
        Optional<Carrinho> item = carrinhoRepository.findByUsuarioAndLivro(
                usuarioOpt.get(),
                livroOpt.get()
        );

        if (item.isPresent()) {
            carrinhoRepository.delete(item.get());
            return true;
        }
        return false;
    }
}