# LivroLivre - Plataforma de Troca e Doação de Livros

O **LivroLivre** é uma plataforma web desenvolvida como projeto de extensão universitária para incentivar a leitura através do compartilhamento, troca e doação de livros de forma totalmente segura, dinâmica e automatizada.

## Tecnologias Utilizadas

### Backend
* **Java 17** & **Spring Boot 3.3.5**
* **Spring Security** & **JWT (JSON Web Tokens)** para autenticação stateless
* **Spring Data JPA** para abstração da camada de persistência
* **Hibernate** como framework ORM
* **Validation (Jakarta)** para consistência dos dados de entrada

### Frontend
* **HTML5**, **CSS3** estruturado (Sem frameworks para otimização de performance)
* **JavaScript Puro (Vanilla JS)** orientado a eventos e assincronismo (Fetch API)

### Banco de Dados & Ferramentas
* **MySQL** para ambiente de produção
* **H2 Database** em memória para execução de testes de integração e testes unitários
* **Maven** para gerenciamento de dependências e automação de builds
* **Lombok** para redução de código boilerplate

---

## Diferenciais Técnicos

* **Arquitetura Imutável com Java Records:** Utilização extensiva de Java Records para a criação de DTOs (*Data Transfer Objects*), garantindo imutabilidade das informações trafegadas, código limpo e conformidade com as melhores práticas modernas do ecossistema Spring.
* **Autenticação Avançada via E-mail:** Transição do modelo de login tradicional para autenticação exclusiva via e-mail e criptografia baseada em **BCryptPasswordEncoder**.
* **Gerenciamento de Sessão Seguro:** Comunicação *stateless* com o cliente injetando tokens JWT dinamicamente nos cabeçalhos das requisições via JavaScript através de filtros customizados na cadeia do Spring Security.
* **Integridade Referencial:** Proteção nativa na camada do banco de dados impedindo a deleção acidental de livros vinculados a transações, ofertas ou carrinhos de compras ativos.

---

## Configuração e Execução Local

### Pré-requisitos
* Java JDK 17 ou superior instalado
* Maven instalado e configurado no PATH
* Servidor MySQL ativo

### 1. Clonar o Repositório
```bash
git clone [https://github.com/vndttx/livrolivre.git](https://github.com/vndttx/livrolivre.git)
cd livrolivre