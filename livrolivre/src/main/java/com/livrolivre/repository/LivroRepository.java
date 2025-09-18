package com.livrolivre.repository;

import com.livrolivre.model.Livro;
import com.livrolivre.model.Usuario;
import com.livrolivre.model.enums.StatusLivro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {

    List<Livro> findByProprietarioAndStatus(Usuario proprietario, StatusLivro status);
}