package com.livrolivre.repository;

import com.livrolivre.model.Carrinho;
import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    Optional<Carrinho> findByUsuarioAndLivro(Usuario usuario, Livro livro);
    List<Carrinho> findByUsuario(Usuario usuario);
    void deleteByUsuarioAndLivro(Usuario usuario, Livro livro);
}

