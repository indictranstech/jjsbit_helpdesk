// cur_frm.add_fetch("raised_email", "mobile_number", "mobile_number")
// cur_frm.add_fetch("raised_email", "department", "branch")
cur_frm.add_fetch("question", "category", "department")
cur_frm.add_fetch("question", "sub_category", "sub_category")
cur_frm.add_fetch("branch", "phone_number", "phone_number")

frappe.ui.form.on("Issue", {
	refresh: function(frm) {
		fields = ["raised_email", "branch", "branch_phone_no", "mobile_number", "question", "priority",
		"problem_since_", "department", "sub_category", "description"]

		if(!has_common(user_roles, ["Branch User", "Branch Manager"])) {
			$.each(fields, function(idx, field) {
				cur_frm.toggle_enable(field, false)
			})
		}
		if(inList(user_roles, "Support Team")) {
			cur_frm.toggle_reqd("resolution_details", true)
		}

		if(!frm.doc.__islocal){
			cur_frm.set_df_property("is_special_ticket", "read_only", 1);
		}

		if((in_list(user_roles, "Branch Manager") || in_list(user_roles, "Branch User")) && (frm.doc.workflow_state == "Sent to Approval" || frm.doc.workflow_state == "Approved" || frm.doc.workflow_state == "Rejected")){
			cur_frm.set_read_only()	
		}
		else if((in_list(user_roles, "Administrator")) && (frm.doc.workflow_state == "Sent to Approval" || frm.doc.workflow_state=="Approved" || frm.doc.workflow_state=="Rejected") && (frm.doc.is_special_ticket) ){
			cur_frm.set_read_only()
		}
		else if((in_list(user_roles, "Ticket Approver")) && (frm.doc.workflow_state == "Open") && (frm.doc.is_special_ticket)){
			cur_frm.set_read_only()
		}

		field_list =  ["phone_number", "status"]
		if((in_list(user_roles, "Ticket Approver"))){
			$.each(field_list, function(idx, field) {
				cur_frm.toggle_enable(field, false)
			})
		}
	},

	validate: function(frm){
		if(in_list(user_roles, "Administrator") && frm.doc.is_special_ticket == 0 && frm.doc.workflow_state == "Sent to Approval"){
			if(!frm.doc.resolution_details){
				cur_frm.set_value("workflow_state","Open");
				refresh_field('workflow_state')
				cur_frm.reload_doc();
			}
			else{
				cur_frm.set_value("workflow_state","Open");
				refresh_field('workflow_state')
				cur_frm.reload_doc();
				frappe.throw(__("Only 'Special Tickets' goes to authorized user for approval."));
				return;
			}
		}
		if(in_list(user_roles, "Administrator") && frm.doc.is_special_ticket == 1 && frm.doc.workflow_state == "Sent to Approval"){
			if(!frm.doc.resolution_details){
				cur_frm.set_value("workflow_state","Open");
				refresh_field('workflow_state')
				cur_frm.reload_doc();
			}
		}
	},

	raised_email: function(frm) {
		frappe.call({
			method: "helpdesk.py.issue.fetch_values",
			args: {
				"raised_email": frm.doc.raised_email 
			},
			callback: function(r) {
				if(r.message){
					$.each(r.message, function(field, val) {
						frm.set_value(field, val)
					})
				}
			}
		})
	}
});

cur_frm.fields_dict['sub_category'].get_query = function(doc) {
	return {
		filters: {
			"category": doc.department
		}
	}
}

cur_frm.fields_dict['raised_email'].get_query = function(doc) {
	return {
		filters: {
			"name": user
		}
	}
}

cur_frm.fields_dict['question'].get_query = function(doc) {
	return {
		filters: {
			"category": doc.department,
			"sub_category": doc.sub_category
		}
	}
}
