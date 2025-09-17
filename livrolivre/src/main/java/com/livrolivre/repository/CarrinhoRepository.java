package com.livrolivre.repository;

import com.livrolivre.model.Carrinho;
import com.livrolivre.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {
    List<Carrinho> findByUsuario(Usuario usuario);
}