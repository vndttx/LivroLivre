package com.livrolivre.service;

import com.livrolivre.model.Carrinho;
import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import com.livrolivre.repository.CarrinhoRepository;
import com.livrolivre.repository.LivroRepository;
import com.livrolivre.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        // Retorna a lista ou null (sugestão: no futuro, prefira retornar List.of() para evitar null)
        return usuario.map(carrinhoRepository::findByUsuario).orElse(null);
    }

    @Transactional
    public Carrinho adicionarItemCarrinho(Long usuarioId, Long livroId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        Optional<Livro> livroOpt = livroRepository.findById(livroId);

        if (usuarioOpt.isPresent() && livroOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            Livro livro = livroOpt.get();

            // CORREÇÃO: Verifica se já existe no carrinho para evitar duplicação
            Optional<Carrinho> existente = carrinhoRepository.findByUsuarioAndLivro(usuario, livro);
            if (existente.isPresent()) {
                return existente.get(); // Retorna o item que já existe
            }

            // Se não existe, cria novo
            Carrinho item = new Carrinho();
            item.setUsuario(usuario);
            item.setLivro(livro);
            item.setQuantidade(1);
            return carrinhoRepository.save(item);
        }
        return null;
    }

    @Transactional
    public boolean removerItemCarrinho(Long usuarioId, Long livroId) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
        Optional<Livro> livroOpt = livroRepository.findById(livroId);

        if (usuarioOpt.isEmpty() || livroOpt.isEmpty()) {
            return false;
        }

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