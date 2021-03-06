<?php
namespace core\model;

/**
 * 
 * @Entity
 * @Table(name="config")
 */
class Configuracao extends Model {
    
    /** @Id @Column(type="string", name="chave", length=20, nullable=false) */
    protected $chave;
    /** @Column(type="string", name="valor", length=20, nullable=false) */
    protected $valor;
    
    // transient
    private $_valor;

    public function __construct($chave, $valor) {
        $this->setChave($chave);
        $this->setValor($valor);
    }
    
    public function getChave() {
        return $this->chave;
    }

    public function setChave($chave) {
        $this->chave = $chave;
    }

    public function getValor() {
        if (!$this->_valor) {
            $this->_valor = unserialize($this->valor);
        }
        return $this->_valor;
    }

    public function setValor($valor) {
        $this->_valor = $valor;
        $this->valor = serialize($valor);
    }

    public function toString() {
        return $this->getChave() . '=' . $this->getValor();
    }
    
    /**
     * Retorna a configuração a partir da chave informada
     * @param type $key
     * @return \core\model\Configuracao
     */
    public static function get($key) {
        $em = \core\db\DB::getEntityManager();
        $query = $em->createQuery("SELECT e FROM \core\model\Configuracao e WHERE e.chave = :key");
        $query->setParameter('key', $key);
        $config = $query->getOneOrNullResult();
        return $config;
    }
    
    /**
     * Cria ou atualiza uma configuração
     * @param type $key
     * @return \core\model\Configuracao
     */
    public static function set($key, $value) {
        $em = \core\db\DB::getEntityManager();
        $query = $em->createQuery("UPDATE \core\model\Configuracao e SET e.valor = :value WHERE e.chave = :key");
        $query->setParameter('key', $key);
        $query->setParameter('value', serialize($value));
        // se não afetou nenhum registro, cria a configuração
        if (!$query->execute()) {
            $config = new Configuracao($key, $value);
            $em->persist($config);
            $em->flush();
        }
    }

}
