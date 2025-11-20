package com.example.careerbot.activities

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.careerbot.databinding.ActivityResourcesBinding
import com.example.careerbot.adapters.ResourceAdapter
import com.example.careerbot.models.ResourceItem
import com.example.careerbot.network.BackendApiClient
import com.example.careerbot.utils.BackendHelper
import kotlinx.coroutines.launch

class ResourcesActivity : AppCompatActivity() {
    private lateinit var binding: ActivityResourcesBinding
    private lateinit var adapter: ResourceAdapter
    private val resources = mutableListOf<ResourceItem>()
    
    companion object {
        private const val TAG = "ResourcesActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            Log.d(TAG, "onCreate: Starting ResourcesActivity")
            
            // Initialize BackendHelper
            BackendHelper.init(this)
            
            binding = ActivityResourcesBinding.inflate(layoutInflater)
            setContentView(binding.root)

            setSupportActionBar(binding.toolbar)
            supportActionBar?.setDisplayHomeAsUpEnabled(true)
            supportActionBar?.title = "Resources"

            binding.toolbar.setNavigationOnClickListener {
                finish()
            }

            setupRecyclerView()
            fetchResources()
        } catch (e: Exception) {
            Log.e(TAG, "onCreate: Error initializing activity", e)
            Toast.makeText(this, "Error loading resources: ${e.message}", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun setupRecyclerView() {
        adapter = ResourceAdapter(resources) { resource ->
            openUrl(resource.url)
        }

        binding.rvResources.layoutManager = LinearLayoutManager(this)
        binding.rvResources.adapter = adapter
    }

    private fun fetchResources() {
        Log.d(TAG, "fetchResources: Starting to fetch resources")
        val token = BackendHelper.getToken()
        
        if (token.isNullOrEmpty()) {
            Log.w(TAG, "fetchResources: No auth token found")
            Toast.makeText(this, "Please login to view resources", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        Log.d(TAG, "fetchResources: Token found, making API call")
        // Show loading
        binding.progressBar.visibility = View.VISIBLE
        binding.rvResources.visibility = View.GONE
        binding.emptyView.visibility = View.GONE

        lifecycleScope.launch {
            try {
                Log.d(TAG, "fetchResources: Calling API...")
                val response = BackendApiClient.backendService.getResources(
                    token = "Bearer $token",
                    limit = 100 // Get all resources
                )

                binding.progressBar.visibility = View.GONE
                Log.d(TAG, "fetchResources: Response received - Success: ${response.isSuccessful}, Code: ${response.code()}")

                if (response.isSuccessful && response.body()?.success == true) {
                    response.body()?.data?.resources?.let { fetchedResources ->
                        Log.d(TAG, "fetchResources: Got ${fetchedResources.size} resources")
                        resources.clear()
                        resources.addAll(fetchedResources)
                        adapter.notifyDataSetChanged()
                        
                        if (resources.isEmpty()) {
                            binding.emptyView.visibility = View.VISIBLE
                            binding.rvResources.visibility = View.GONE
                        } else {
                            binding.rvResources.visibility = View.VISIBLE
                            binding.emptyView.visibility = View.GONE
                        }
                    }
                } else {
                    val errorMessage = response.body()?.message ?: "Failed to load resources"
                    Log.e(TAG, "fetchResources: API error - $errorMessage")
                    Toast.makeText(this@ResourcesActivity, errorMessage, Toast.LENGTH_SHORT).show()
                    binding.emptyView.visibility = View.VISIBLE
                }
            } catch (e: Exception) {
                Log.e(TAG, "fetchResources: Exception occurred", e)
                e.printStackTrace()
                binding.progressBar.visibility = View.GONE
                binding.emptyView.visibility = View.VISIBLE
                Toast.makeText(
                    this@ResourcesActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun getAuthToken(): String? {
        return BackendHelper.getToken()
    }

    private fun openUrl(url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "Cannot open URL", Toast.LENGTH_SHORT).show()
        }
    }
}





