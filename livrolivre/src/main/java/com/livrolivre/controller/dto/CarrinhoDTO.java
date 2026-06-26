package com.livrolivre.controller.dto;

import com.livrolivre.model.Livro;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarrinhoDTO {
    private String usuarioId;
    private List<Livro> livros;
}