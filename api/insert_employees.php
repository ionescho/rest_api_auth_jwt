<?php
// required headers
header("Access-Control-Allow-Origin: http://localhost/rest-api-authentication-example/");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// required to encode json web token
include_once 'config/core.php';
include_once 'libs/php-jwt-master/src/BeforeValidException.php';
include_once 'libs/php-jwt-master/src/ExpiredException.php';
include_once 'libs/php-jwt-master/src/SignatureInvalidException.php';
include_once 'libs/php-jwt-master/src/JWT.php';
use \Firebase\JWT\JWT;

// files needed to connect to database
include_once 'config/database.php';
include_once 'objects/employee_hierarchy.php';

// get database connection
$database = new Database();
$db = $database->getConnection();

// instantiate employee_hierarchy object
$employee_hierarchy = new EmployeeHierarchy($db);

// get posted data
$data = json_decode(file_get_contents("php://input"));

// get jwt
$jwt=isset($data->jwt) ? $data->jwt : "";

// if jwt is not empty
if($jwt){

    try {
        // set product property values
        $employee_hierarchy->hierarchy = json_encode($data->hierarchy);

        // create hierarchy record
        if($employee_hierarchy->create_or_update()){

            // set response code
            http_response_code(200);

            // response in json format
            echo json_encode(
                    array(
                        "message" => "Hierarchy was saved.",
                        "jwt" => $jwt
                    )
                );
        }

        // message if unable to save hierarchy
        else{
            // set response code
            http_response_code(401);

            // show error message
            echo json_encode(array("message" => "Unable to save hierarchy."));
        }
    }

    // if decode fails, it means jwt is invalid
    catch (Exception $e){

        // set response code
        http_response_code(401);

        // show error message
        echo json_encode(array(
            "message" => "Access denied.",
            "error" => $e->getMessage()
        ));
    }
}

// show error message if jwt is empty
else{

    // set response code
    http_response_code(401);

    // tell the user access denied
    echo json_encode(array("message" => "Access denied."));
}
?>
