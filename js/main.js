import JSONViewer from "./json-viewer.js";
import compose_tree from "./compose_tree.js"

// jQuery codes
$(document).ready(function(){

    // try to show the home page
    showHomePage();

    // show update account form
    $(document).on('click', '#update_account', function(){
        showUpdateAccountForm();
    });

    // show employee form
    $(document).on('click', '#employees', function(){
        showEmployeeForm();
    });

    // show home page
    $(document).on('click', '#home', function(){
        showHomePage();
        clearResponse();
    });

    // logout the user
    $(document).on('click', '#logout', function(){
        showLoginPage();
        $('#response').html("<div class='alert alert-info'>You are logged out.</div>");
    });

    // show login form
    $(document).on('click', '#login', function(){
        showLoginPage();
    });

    // show sign up / registration form
    $(document).on('click', '#sign_up', function(){

        var html = `
            <h2>Sign Up</h2>
            <form id='sign_up_form'>
            	<div class="form-group">
            		<label for="firstname">Firstname</label>
            		<input type="text" class="form-control" name="firstname" id="firstname" required />
            	</div>

            	<div class="form-group">
            		<label for="lastname">Lastname</label>
            		<input type="text" class="form-control" name="lastname" id="lastname" required />
            	</div>

            	<div class="form-group">
            		<label for="email">Email</label>
            		<input type="email" class="form-control" name="email" id="email" required />
            	</div>

            	<div class="form-group">
            		<label for="password">Password</label>
            		<input type="password" class="form-control" name="password" id="password" required />
            	</div>

                <button type='submit' class='btn btn-primary'>Sign Up</button>
            </form>
            `;

        clearResponse();
        $('#content').html(html);
    });

    // trigger when 'update account' form is submitted
    $(document).on('submit', '#update_account_form', function(){

        // handle for update_account_form
        var update_account_form=$(this);

        // validate jwt to verify access
        var jwt = getCookie('jwt');

        // get form data
        var update_account_form_obj = update_account_form.serializeObject()

        // add jwt on the object
        update_account_form_obj.jwt = jwt;

        // convert object to json string
        var form_data=JSON.stringify(update_account_form_obj);

        // submit form data to api
        $.ajax({
            url: "api/update_user.php",
            type : "POST",
            contentType : 'application/json',
            data : form_data,
            success : function(result) {

                // tell the user account was updated
                $('#response').html("<div class='alert alert-success'>Account was updated.</div>");

                // store new jwt to cookie
                setCookie("jwt", result.jwt, 1);
            },

            // show error message to user
            error: function(xhr, resp, text){
                if(xhr.responseJSON.message=="Unable to update user."){
                    $('#response').html("<div class='alert alert-danger'>Unable to update account.</div>");
                }

                else if(xhr.responseJSON.message=="Access denied."){
                    showLoginPage();
                    $('#response').html("<div class='alert alert-success'>Access denied. Please login</div>");
                }
            }
        });

        return false;
    });

    // trigger when login form is submitted
    $(document).on('submit', '#login_form', function(){

        // get form data
        var login_form=$(this);
        var form_data=JSON.stringify(login_form.serializeObject());

        // submit form data to api
        $.ajax({
            url: "api/login.php",
            type : "POST",
            contentType : 'application/json',
            data : form_data,
            success : function(result){

                // store jwt to cookie
                setCookie("jwt", result.jwt, 1);

                // show home page & tell the user it was a successful login
                showHomePage();
                $('#response').html("<div class='alert alert-success'>Successful login.</div>");

            },
            error: function(xhr, resp, text){
                // on error, tell the user login has failed & empty the input boxes
                $('#response').html("<div class='alert alert-danger'>Login failed. Email or password is incorrect.</div>");
                login_form.find('input').val('');
            }
        });

        return false;
    });

    // trigger when registration form is submitted
    $(document).on('submit', '#sign_up_form', function(){

        // get form data
        var sign_up_form=$(this);
        var form_data=JSON.stringify(sign_up_form.serializeObject());

        // submit form data to api
        $.ajax({
            url: "api/create_user.php",
            type : "POST",
            contentType : 'application/json',
            data : form_data,
            success : function(result) {
                // if response is a success, tell the user it was a successful sign up & empty the input boxes
                $('#response').html("<div class='alert alert-success'>Successful sign up. Please login.</div>");
                sign_up_form.find('input').val('');
            },
            error: function(xhr, resp, text){
                // on error, tell the user sign up failed
                $('#response').html("<div class='alert alert-danger'>Unable to sign up. Please contact admin.</div>");
            }
        });

        return false;
    });

    let make_hierarchy_pretty_html = (tree) => {
        var employee_results_html = `
            <br/><br/>
            <div id="hierarchy_card" class="card">
                <div class="card-header">Employee Hierarchy</div>
                <div class="card-body">
                    <h5 class="card-title">The key-value employee-supervisor pair translates hierarchically into:.</h5>
                    <div class="card-text"></div>
                </div>
            </div>
            `;
        $("#employee_hierarchy_results").html(employee_results_html);

        var jsonViewer = new JSONViewer();
        document.querySelector("#hierarchy_card .card-text").appendChild(jsonViewer.getContainer());
        jsonViewer.showJSON(tree);
    }

    $(document).on('submit', '#employees_form', function(){
        // get form data
        let employees_form = $(this);
        let employees = JSON.parse(employees_form.serializeObject().employee_json);
        let tree;

        try {
            tree = compose_tree(employees);
        } catch(error) {
            $('#response').html("<div class='alert alert-danger'>"+error.message+"</div>");
            return false;
        }
        console.log("TREE",tree);

        make_hierarchy_pretty_html(tree);

        // validate jwt to verify access
        var jwt = getCookie('jwt');

        // get form data
        var save_hierarchy_obj = {
            jwt: jwt,
            hierarchy: tree
        };

        // convert object to json string
        var form_data=JSON.stringify(save_hierarchy_obj);

        $.ajax({
            url: "api/insert_employees.php",
            type : "POST",
            contentType : 'application/json',
            data : form_data,
            success : function(result) {
                // tell the user account was updated
                $('#response').html("<div class='alert alert-success'>Hierarchy was saved.</div>");
            },

            // show error message to user
            error: function(xhr, resp, text){
                if(xhr.responseJSON.message=="Unable to save hierarchy."){
                    $('#response').html("<div class='alert alert-danger'>Unable to save hierarchy.</div>");
                }

                else if(xhr.responseJSON.message=="Access denied."){
                    showLoginPage();
                    $('#response').html("<div class='alert alert-success'>Access denied. Please login</div>");
                }
            }
        });

        return false;
    });

    // show login page
    function showLoginPage(){

        // remove jwt
        setCookie("jwt", "", 1);

        // login page html
        var html = `
            <h2>Login</h2>
            <form id='login_form'>
                <div class='form-group'>
                    <label for='email'>Email address</label>
                    <input type='email' class='form-control' id='email' name='email' placeholder='Enter email'>
                </div>

                <div class='form-group'>
                    <label for='password'>Password</label>
                    <input type='password' class='form-control' id='password' name='password' placeholder='Password'>
                </div>

                <button type='submit' class='btn btn-primary'>Login</button>
            </form>
            `;

        $('#content').html(html);
        clearResponse();
        showLoggedOutMenu();
    }

    // show home page
    function showHomePage(){

        // validate jwt to verify access
        var jwt = getCookie('jwt');

        $.post("api/validate_token.php", JSON.stringify({ jwt:jwt })).done(function(result) {

            // if valid, show homepage
            var html = `
                <div class="card">
                    <div class="card-header">Welcome to Home!</div>
                    <div class="card-body">
                        <h5 class="card-title">You are logged in.</h5>
                        <p class="card-text">You won't be able to access the home and account pages if you are not logged in.</p>
                    </div>
                </div>
                `;

            $('#content').html(html);
            showLoggedInMenu();

        })

            // show login page on error
            .fail(function(result){
                showLoginPage();
                $('#response').html("<div class='alert alert-danger'>Please login to access the home page.</div>");
            });
    }

    function showUpdateAccountForm(){
        // validate jwt to verify access
        var jwt = getCookie('jwt');
        $.post("api/validate_token.php", JSON.stringify({ jwt:jwt })).done(function(result) {

            // if response is valid, put user details in the form
            var html = `
                    <h2>Update Account</h2>
                    <form id='update_account_form'>
                        <div class="form-group">
                            <label for="firstname">Firstname</label>
                            <input type="text" class="form-control" name="firstname" id="firstname" required value="` + result.data.firstname + `" />
                        </div>

                        <div class="form-group">
                            <label for="lastname">Lastname</label>
                            <input type="text" class="form-control" name="lastname" id="lastname" required value="` + result.data.lastname + `" />
                        </div>

                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" name="email" id="email" required value="` + result.data.email + `" />
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" class="form-control" name="password" id="password" />
                        </div>

                        <button type='submit' class='btn btn-primary'>
                            Save Changes
                        </button>
                    </form>
                `;

            clearResponse();
            $('#content').html(html);

        })

            // on error/fail, tell the user he needs to login to show the account page
            .fail(function(result){
                showLoginPage();
                $('#response').html("<div class='alert alert-danger'>Please login to access the account page.</div>");
            });

    }

    function getEmployees() {
        var promise = new Promise((resolve, reject) => {
            $.ajax({
                url: "api/fetch_employees.php",
                type : "GET",
                contentType : 'application/json',
                success : function(result) {
                    resolve(result);
                },
                // show error message to user
                error: function(xhr, resp, text){
                    if(xhr.responseJSON.message=="Access denied."){
                        showLoginPage();
                        $('#response').html("<div class='alert alert-success'>Access denied. Please login</div>");
                    }
                    reject();
                }
            });
        });
        return promise;
    }

    let make_key_value_from_hierarchy = (employee_hierarchy) => {

    }

    function showEmployeeForm(){
        // validate jwt to verify access
        var jwt = getCookie('jwt');
        $.post("api/validate_token.php", JSON.stringify({ jwt: jwt })).done(function(result) {
            getEmployees().then((employee_hierarchy) => {
                // if response is valid, put user details in the form
                var html = `
                    <h2>Employee Form</h2>
                    <form id='employees_form'>
                        <div class="form-group">
                            <label for="employee_json">Insert the employee-supervisor relationship JSON in the following textarea(please put keys in quotes for it to be a valid JSON) </label>
                            <textarea class="form-control" name="employee_json" id="employee_json" required value="" rows="10" />
                        </div>

                        <button type='submit' class='btn btn-primary'>
                            Save Changes
                        </button>
                    </form>
                    <div id="employee_hierarchy_results"></div>
                `;

                clearResponse();
                $('#content').html(html);

                if(employee_hierarchy) {
                    make_hierarchy_pretty_html(employee_hierarchy);
                    make_key_value_from_hierarchy(employee_hierarchy);
                }
            });
        })
        .fail(function(result){
            showLoginPage();
            $('#response').html("<div class='alert alert-danger'>Please login to access the employee page.</div>");
        });
    }

    // if the user is logged in
    function showLoggedInMenu(){
        // hide login and sign up from navbar & show logout button
        $("#login, #sign_up").hide();
        $("#logout").show();
    }

    // if the user is logged out
    function showLoggedOutMenu(){
        // show login and sign up from navbar & hide logout button
        $("#login, #sign_up").show();
        $("#logout").hide();
    }

    // remove any prompt messages
    function clearResponse(){
        $('#response').html('');
    }

    // function to make form values to json format
    $.fn.serializeObject = function(){

        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    // function to set cookie
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    // get or read cookie
    function getCookie(cname){
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' '){
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

});