package com.example.careerbot.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.careerbot.R
import com.example.careerbot.models.LearningGoal
import com.google.android.material.card.MaterialCardView

class GoalAdapter(
    private val goals: List<LearningGoal>,
    private val onItemClick: (LearningGoal) -> Unit
) : RecyclerView.Adapter<GoalAdapter.GoalViewHolder>() {

    class GoalViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val cardView: MaterialCardView = itemView.findViewById(R.id.cardGoal)
        val tvGoal: TextView = itemView.findViewById(R.id.tvGoal)
        val progressBar: ProgressBar = itemView.findViewById(R.id.progressBar)
        val tvProgress: TextView = itemView.findViewById(R.id.tvProgress)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GoalViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_goal, parent, false)
        return GoalViewHolder(view)
    }

    override fun onBindViewHolder(holder: GoalViewHolder, position: Int) {
        val goal = goals[position]
        holder.tvGoal.text = goal.goal
        holder.progressBar.progress = goal.progress
        holder.tvProgress.text = "${goal.progress}%"

        holder.cardView.setOnClickListener {
            onItemClick(goal)
        }
    }

    override fun getItemCount(): Int = goals.size
}





