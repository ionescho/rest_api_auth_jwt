<?php
// 'user' object
class EmployeeHierarchy{

    // database connection and table name
    private $conn;
    private $table_name = "employee_hierarchy";

    // object properties
	public $hierarchy;

	// constructor
    public function __construct($db){
        $this->conn = $db;
    }

    // create new hierarchy record
    function create_or_update(){

        // insert query
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    single_row = 1,
                    hierarchy = :hierarchy
                ON DUPLICATE KEY UPDATE
                    hierarchy = :hierarchy";

		// prepare the query
        $stmt = $this->conn->prepare($query);

		// sanitize
		$this->hierarchy = htmlspecialchars(strip_tags($this->hierarchy));

		// bind the values
        $stmt->bindParam(':hierarchy', $this->hierarchy);

		// execute the query, also check if query was successful
		try{
            if($stmt->execute()){
                return true;
            }
        }catch(PDOException $exception){
            echo "Query error: " . $exception->getMessage();
        }

        return false;
    }

    // fetch the hierarchy from the database
    function get(){

        // query to fetch hierarchy
        $query = "SELECT hierarchy
                FROM " . $this->table_name . "
                LIMIT 1";

        // prepare the query
        $stmt = $this->conn->prepare( $query );

        // execute the query
        $stmt->execute();

        // get number of rows
        $num = $stmt->rowCount();

        if($num>0){

            // get record details / values
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            // return the hierarchy
            return $row;
        }

        // return false if no hierarchy is present yet
        return false;
    }

}
?>
