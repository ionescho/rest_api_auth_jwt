<?php
// 'user' object
class Employee{

    // database connection and table name
    private $conn;
    private $table_name = "employees";

    // object properties
	public $id;
	public $name;
	public $supervisor_id;

	// constructor
    public function __construct($db){
        $this->conn = $db;
    }

    // update a user record
    public function update(){

    	// if no posted password, do not update the password
    	$query = "UPDATE " . $this->table_name . "
    			SET
    				name = :name,
    				supervisor_id = :supervisor_id,
    			WHERE id = :id";

    	// prepare the query
    	$stmt = $this->conn->prepare($query);

    	// sanitize
    	$this->name=htmlspecialchars(strip_tags($this->name));
    	$this->supervisor_id=htmlspecialchars(strip_tags($this->supervisor_id));

    	// bind the values from the form
    	$stmt->bindParam(':name', $this->name);
    	$stmt->bindParam(':supervisor_id', $this->supervisor_id);

    	// unique ID of record to be edited
    	$stmt->bindParam(':id', $this->id);

    	// execute the query
    	if($stmt->execute()){
    		return true;
    	}

    	return false;
    }

    // create new user record
    function create($supervisor_id){

        // insert query
        $query = "INSERT INTO " . $this->table_name . "
                SET
					name = :name,
					supervisor_id = :supervisor_id";

		// prepare the query
        $stmt = $this->conn->prepare($query);

		// sanitize
		$this->name = htmlspecialchars(strip_tags($this->name));
		$this->supervisor_id = $supervisor_id;

		// bind the values
        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':supervisor_id', $supervisor_id);

		// execute the query, also check if query was successful
        if($stmt->execute()){
            return true;
        }

        return false;
    }

}
?>
