package com.livrolivreapp.repository;

import com.livrolivreapp.model.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    List<Emprestimo> findByUsuarioId(Long usuarioId);

    Optional<Emprestimo> findByUsuarioIdAndLivroId(Long usuarioId, Long livroId);

}