# -*- coding: utf-8 -*-
# Copyright (c) 2015, helpdesk and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Priority(Document):
	def on_trash(self):
		if self.name == "Default":
			frappe.throw("Can not delete the default Priority")
